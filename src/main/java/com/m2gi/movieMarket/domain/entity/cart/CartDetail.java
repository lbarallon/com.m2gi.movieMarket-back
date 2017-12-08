package com.m2gi.movieMarket.domain.entity.cart;

import java.io.Serializable;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Set;

import javax.persistence.*;

import com.m2gi.movieMarket.domain.entity.movie.*;
@Entity
@Table(name="cartDetail")
public class CartDetail implements Serializable {
    @Id
    @GeneratedValue( strategy = GenerationType.AUTO )
    private int id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cart", referencedColumnName = "cart_id")
    private Cart cart;

    @ManyToOne(optional = false)
    @JoinColumn(name = "movie", referencedColumnName = "movie_id")
    private Movie movie;

    // @ManyToOne(optionnal = false, targetEntity = Movie.Class);

    @Column(name = "quantity")
    private int quantity;
    
    public int getId() {
        return this.id;
    }

    public int getQuantity() {
        return this.quantity;
    }
    
    public CartDetail setQuantity(int quantity) {
        this.quantity = quantity;
        
        return this;
    }
}