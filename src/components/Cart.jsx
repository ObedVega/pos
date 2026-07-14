import React from "react";
import "./Cart.css";

export default function Cart(){

    return(

        <div className="cart-card">

            <div className="cart-header">

                <span>Qty</span>

                <span>Item</span>

                <span>Price</span>

                <span>Total</span>

            </div>

            <div className="cart-empty">

                Waiting for scanned items...

            </div>

        </div>

    );

}