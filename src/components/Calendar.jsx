import React from "react";
import "./Calendar.css";

export default function Calendar() {

    const today = new Date();

    return (

        <div className="calendar-card">

            <span className="calendar-title">
                Today
            </span>

            <div className="calendar-day">
                {today.getDate()}
            </div>

            <div className="calendar-month">
                {today.toLocaleString("en-US",{month:"long"})}
            </div>

            <div className="calendar-year">
                {today.getFullYear()}
            </div>

        </div>

    );

}