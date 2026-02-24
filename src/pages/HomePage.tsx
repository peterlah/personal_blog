import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [pages, setPages] = useState<string[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/pages')
      .then(res => res.json())
      .then(data => setPages(data))
      .catch(err => console.error("Failed to fetch pages:", err));
  }, []);

  return (
    <div>
      <h1>Wiki Pages</h1>
      <div className="list-group">
        {pages.map(page => (
          <Link key={page} to={`/view/${page}`} className="list-group-item list-group-item-action">
            {page}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
