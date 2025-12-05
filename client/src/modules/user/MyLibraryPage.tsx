import React, { useEffect, useState } from 'react';
import { myLibraryApi, MyProfile, CurrentLoan } from '../../api/myLibraryApi';
import { Spinner } from '../../components/Spinner';
import { ErrorAlert } from '../../components/ErrorAlert';

export default function MyLibraryPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [currentLoans, setCurrentLoans] = useState<CurrentLoan[]>([]);
  const [loanHistory, setLoanHistory] = useState<CurrentLoan[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(undefined);
      const [profileData, currentData, historyData] = await Promise.all([
        myLibraryApi.getProfile(),
        myLibraryApi.getCurrentLoans(),
        myLibraryApi.getLoanHistory()
      ]);
      setProfile(profileData);
      setCurrentLoans(currentData);
      setLoanHistory(historyData);
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorAlert error={error} />;
  if (!profile) return <div>Không có dữ liệu</div>;

  const isOverdue = (dueAt?: string) => {
    if (!dueAt) return false;
    return new Date(dueAt) < new Date();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const getDaysLate = (dueAt?: string) => {
    if (!dueAt) return 0;
    const due = new Date(dueAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="container py-3">
      <h2 className="mb-4">📚 Thư viện của tôi</h2>

      {/* Thông tin cá nhân */}
      <div className="card-grid mb-4">
        <div className="stat-card">
          <div className="stat-card__label">Bạn đọc</div>
          <div className="stat-card__value" style={{ fontSize: '1.2rem' }}>{profile.reader.name}</div>
          {profile.reader.email && <small>{profile.reader.email}</small>}
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Quota còn lại</div>
          <div className="stat-card__value" style={{ color: profile.reader.quota > 0 ? '#28a745' : '#dc3545' }}>
            {profile.reader.quota}/{profile.reader.maxQuota}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Đang mượn</div>
          <div className="stat-card__value" style={{ color: '#ffc107' }}>{profile.stats.borrowedCount}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: profile.stats.overdueCount > 0 ? '4px solid #dc3545' : 'none' }}>
          <div className="stat-card__label">Quá hạn</div>
          <div className="stat-card__value" style={{ color: profile.stats.overdueCount > 0 ? '#dc3545' : '#6c757d' }}>
            {profile.stats.overdueCount}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="panel">
        <div className="d-flex border-bottom">
          <button
            className={`btn btn-link ${activeTab === 'current' ? 'text-primary fw-bold' : 'text-secondary'}`}
            onClick={() => setActiveTab('current')}
            style={{ textDecoration: 'none' }}
          >
            Đang mượn ({currentLoans.length})
          </button>
          <button
            className={`btn btn-link ${activeTab === 'history' ? 'text-primary fw-bold' : 'text-secondary'}`}
            onClick={() => setActiveTab('history')}
            style={{ textDecoration: 'none' }}
          >
            Lịch sử mượn ({loanHistory.length})
          </button>
        </div>

        <div className="p-3">
          {activeTab === 'current' ? (
            // Sách đang mượn
            currentLoans.length === 0 ? (
              <div className="text-center text-muted py-4">
                Bạn chưa mượn sách nào
              </div>
            ) : (
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã sách</th>
                    <th>Tên sách</th>
                    <th>Tác giả</th>
                    <th>Ngày mượn</th>
                    <th>Hạn trả</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLoans.map((loan, index) => (
                    <tr key={loan.id} className={isOverdue(loan.dueAt) ? 'table-danger' : ''}>
                      <td>{index + 1}</td>
                      <td>{loan.book.code}</td>
                      <td>{loan.book.title}</td>
                      <td>{loan.book.author}</td>
                      <td>{formatDate(loan.borrowedAt)}</td>
                      <td>{formatDate(loan.dueAt)}</td>
                      <td>
                        {isOverdue(loan.dueAt) ? (
                          <span className="badge bg-danger">
                            Quá hạn {getDaysLate(loan.dueAt)} ngày
                          </span>
                        ) : (
                          <span className="badge bg-success">Còn hạn</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            // Lịch sử mượn
            loanHistory.length === 0 ? (
              <div className="text-center text-muted py-4">
                Chưa có lịch sử mượn sách
              </div>
            ) : (
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã sách</th>
                    <th>Tên sách</th>
                    <th>Tác giả</th>
                    <th>Ngày mượn</th>
                    <th>Ngày trả</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {loanHistory.map((loan, index) => {
                    const wasLate = loan.dueAt && loan.returnedAt && new Date(loan.returnedAt) > new Date(loan.dueAt);
                    const daysLate = wasLate ? Math.floor((new Date(loan.returnedAt!).getTime() - new Date(loan.dueAt!).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                    
                    return (
                      <tr key={loan.id}>
                        <td>{index + 1}</td>
                        <td>{loan.book.code}</td>
                        <td>{loan.book.title}</td>
                        <td>{loan.book.author}</td>
                        <td>{formatDate(loan.borrowedAt)}</td>
                        <td>{formatDate(loan.returnedAt)}</td>
                        <td>
                          {wasLate ? (
                            <span className="badge bg-warning text-dark">
                              Trả trễ {daysLate} ngày
                            </span>
                          ) : (
                            <span className="badge bg-success">Đúng hạn</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>
    </div>
  );
}
