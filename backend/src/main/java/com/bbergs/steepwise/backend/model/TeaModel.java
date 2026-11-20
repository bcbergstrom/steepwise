package com.steepwise.model;

import jakarta.persistence.*;

@Entity
@Table(name = "teas")
public class Tea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String type;

    private int steepTimeSeconds;

    protected Tea() {
        // Required by JPA
    }

    public Tea(String name, String type, int steepTimeSeconds) {
        this.name = name;
        this.type = type;
        this.steepTimeSeconds = steepTimeSeconds;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public int getSteepTimeSeconds() {
        return steepTimeSeconds;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setSteepTimeSeconds(int steepTimeSeconds) {
        this.steepTimeSeconds = steepTimeSeconds;
    }
}