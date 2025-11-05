// src/ProfileManagement.jsx

import React from 'react';

export default function ProfileManagement() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 border-b pb-2 text-gray-800">
        마이페이지 - 회원 정보 관리
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
        <p className="text-xl font-semibold">환영합니다! 사용자 님</p>
        <div className="p-4 bg-gray-50 rounded-lg">
            <p>이름: 홍길동</p>
            <p>이메일: user@example.com</p>
        </div>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            정보 수정 폼으로 이동
        </button>
      </div>
      
      <h2 className="text-2xl font-bold mt-8 mb-4 border-b pb-1">입양 신청 내역</h2>
      <p className="text-gray-500">신청 내역이 없습니다.</p>
    </div>
  );
}