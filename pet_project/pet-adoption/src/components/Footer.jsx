//import React from 'react';

// --- CSS Block for Styling ---
const styles = `
.footer-container {
  background-color: #F2E2CE; /* C3: Light Beige Background */
  margin-top: 2rem;
  padding: 2.5rem 0; /* py-10 equivalent */
  border-top: 1px solid #F2CBBD; /* C4: Soft Border */
}

.footer-content {
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 1rem;
  text-align: center;
  font-size: 0.75rem; /* text-xs */
  color: #735048; /* C5: Secondary Text Color */
}
`;
// --- End CSS Block ---


function Footer() {
  return (
    <>
      <style>{styles}</style>
      <footer className="footer-container">
          <div className="footer-content">
            <p>
              푸딩조 | 서울특별시 동대문구 당산로 26 경인여자대학교 | Copyright © 2025 by 푸딩조. All rights reserved.
            </p>
        </div>
      </footer>
    </>
  );
}

export default Footer;