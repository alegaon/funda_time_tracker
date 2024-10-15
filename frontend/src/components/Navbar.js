import React from 'react';

const Navbar = ({ user }) => {
  if (!user) {
    return <nav className="navbar navbar-expand-lg navbar-light bg-light">Loading...</nav>;
  }

    // create a obj to store nav items
    const navItems = [
      { title: 'Home', link: '/' },
      { title: 'Profile', link: '/profile' },
      { title: 'Logout', link: '/logout' },
      { title: 'Agenda', link: '/agenda' },
      { title: 'Staff', link: '/staff' },
    ];

  // check url and build nav items
  if (user.is_admin) {
    navItems.push({ title: 'Admin', link: '/admin' });
  }

  if (user.is_staff) {
    navItems.push({ title: 'Staff', link: '/staff' });
  }

  if (window.location.pathname === '/profile') {
    navItems.push({ title: 'Edit Profile', link: '/edit' });
    navItems.push({ title: 'Dashboard', link: '/dashboard' });
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="/profile">{user.username}</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {navItems.map((item, index) => (
              <li key={index} className="nav-item">
                <a className="nav-link" href={item.link}>{item.title}</a>
              </li>
            ))}
          </ul>
          <form className="d-flex">
            <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search"/>
            <button className="btn btn-outline-success" type="submit">Search</button>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
