package com.artigofinder.models;

public class Autor {
    private String nome;
    private String autorId;

    public Autor() {
    }

    public Autor(String nome, String autorId) {
        this.nome = nome;
        this.autorId = autorId;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getAutorId() {
        return autorId;
    }

    public void setAutorId(String autorId) {
        this.autorId = autorId;
    }
}