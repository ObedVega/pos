import React, { useEffect, useState } from "react";
import "./Header.css";

export default function Header() {

  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {

    const updateClock = () => {

      const now = new Date();

      const time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      setCurrentTime(time);

    };

    updateClock();

    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);

  }, []);

  return (
    <header className="header">

      <div className="header-left">

        <h1>Chiquita Catering POS</h1>

        <span>Warehouse Management System</span>

      </div>

      <div className="header-center">

        <input
          type="text"
          placeholder="Global Search..."
        />

      </div>

      <div className="header-right">

        <div className="clock">
          {currentTime}
        </div>

        <div className="user">

          <div className="avatar">
            A
          </div>

          <div>

            <strong>Admin</strong>

            <small>Operator</small>

          </div>

        </div>

      </div>

    </header>
  );
}