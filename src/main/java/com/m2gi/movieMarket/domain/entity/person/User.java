package com.m2gi.movieMarket.domain.entity.person;

import org.mindrot.jbcrypt.BCrypt;

import javax.persistence.*;
import java.io.Serializable;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user")
public class User extends Person implements Serializable, Principal {

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private int id;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private List<UserRole> userRoles = new ArrayList<>();

    @Column(name = "username")
    private String username;

    @Column(name = "email")
    private String email;

    @Column(name = "password")
    private String password;

    public User() {}

    @Override
    public int getId() {
        return this.id;
    }

    @Override
    public User setId(int id) {
        this.id = id;

        return this;
    }

    public List<UserRole> getUserRoles() {
        return this.userRoles;
    }

    public boolean hasRole(String role) {
        for (UserRole userRole : this.getUserRoles()) {
            if (userRole.hasRole(role)) {
                return true;
            }
        }

        return false;
    }

    public User addUserRole(UserRole userRole) {

        this.userRoles.add(userRole);

        return this;
    }

    public String getUsername() {
        return this.username;
    }

    public User setUsername(String username) {
        this.username = username;

        return this;
    }

    public String getEmail() {
        return this.email;
    }

    public User setEmail(String email) {
        this.email = email;

        return this;
    }

    public boolean checkPassword(String password) {
        //String hashed = BCrypt.hashpw(password, BCrypt.gensalt(12));
        System.out.println(this.password);
        return BCrypt.checkpw(password, this.password);
    }

    public User setPassword(String password) {
        String hashed = BCrypt.hashpw(password, BCrypt.gensalt(12));

        this.password = hashed;

        return this;
    }

    @Override
    public String getName() {
        return this.getFirstname() + " " + this.getLastname();
    }
}
