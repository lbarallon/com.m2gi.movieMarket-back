package com.m2gi.movieMarket.domain.repository.person;

import com.m2gi.movieMarket.domain.entity.person.Address;
import com.m2gi.movieMarket.domain.entity.person.User;

import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

@Stateless
public class AddressFacade implements AddressFacadeLocal {
    @PersistenceContext()
    private EntityManager em;


    @Override
    public int create(Address address, int userId) {
        User user = this.em.find(User.class, userId);

        user.addAddress(address);

        this.em.persist(address);
        this.em.flush();

        return address.getId();
    }
}