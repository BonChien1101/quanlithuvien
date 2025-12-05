import React from 'react';
import { Link } from 'react-router-dom';

export default function UserHome() {
  return (
    <div className="container py-3">
      {/* Khối hero */}
      <div className="mb-4" style={{
        background: 'linear-gradient(135deg, #1f6feb 0%, #7c3aed 50%, #ec4899 100%)',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 16px 40px rgba(0,0,0,0.12)'
      }}>
        <div className="row g-0 align-items-center">
          <div className="col-md-7 p-4 p-md-5 text-white">
            <h1 style={{fontWeight: 800, lineHeight: 1.1}}>Khám phá kho sách phong phú</h1>
            <p className="mt-3" style={{opacity: 0.95}}>Tìm kiếm theo tên sách, tác giả, lọc theo thể loại. Xem chi tiết và số lượng tồn ngay lập tức.</p>
            <div className="mt-3">
              <Link to="/user/browse" className="btn btn-light btn-lg" style={{color:'#1f2937'}}>
                Đến thư viện
              </Link>
            </div>
          </div>
          <div className="col-md-5 d-none d-md-block">
            <img
              src="https://png.pngtree.com/thumb_back/fh260/background/20210902/pngtree-the-background-photography-of-the-empty-library-bookstore-indoors-image_785539.jpg"
              alt="Books"
              style={{ width: '90%', height: '90%', objectFit: 'cover', borderRadius: '12px' }}
            />
          </div>
        </div>
      </div>

      {/* Khối giới thiệu  */}
      <div className="card-grid mb-4">
        <div className="stat-card stat-card--accent">
          <div className="stat-card__label">Tìm kiếm</div>
          <div className="stat-card__value" style={{fontSize: '20px'}}>Theo tên sách & tác giả</div>
        </div>
        <div className="stat-card" style={{background:'#fff4e6', borderColor:'#ffd8a8'}}>
          <div className="stat-card__label">Lọc nhanh</div>
          <div className="stat-card__value" style={{fontSize: '20px'}}>Theo thể loại</div>
        </div>
        <div className="stat-card" style={{background:'#e6fffb', borderColor:'#a5f3fc'}}>
          <div className="stat-card__label">Thông tin rõ ràng</div>
          <div className="stat-card__value" style={{fontSize: '20px'}}>Chi tiết & tồn kho</div>
        </div>
      </div>
    </div>
  );
}
