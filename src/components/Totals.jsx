import React from "react";
import "./Totals.css";

export default function Totals(){

    return(

        <div className="totals-card">

            <div className="totals-header">

                <h2>Sale Summary</h2>

   

            </div>

            <div className="total-row">

                <span>Items</span>

                <strong>1</strong>

            </div>

            <div className="total-row">

                <span>Subtotal</span>

                <strong>$4.20</strong>

            </div>

            <div className="total-row">

                <span>Tax</span>

                <strong>$0.00</strong>

            </div>

            <div className="grand-total">

                <span>Total</span>

                <h1>$4.20</h1>

            </div>

        </div>

    );

}