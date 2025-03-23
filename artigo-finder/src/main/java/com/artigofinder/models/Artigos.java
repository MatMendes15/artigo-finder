package com.artigofinder.models;

import java.util.ArrayList;
import java.util.List;

public class Artigos {
    private String id;
    private String titulo;
    private String resumo;
    private List<Autor> autores = new ArrayList<>();
    private Integer ano;
    private String url;
    private int citacoes;
    private List<String> referencias = new ArrayList<>();
    private String venue;
    private String doi;
    private boolean favorito;

    public Artigos() {
    }

    public Artigos(String id, String titulo, String resumo, List<Autor> autores,
                   Integer ano, String url, int citacoes, List<String> referencias,
                   String venue, String doi) {
        this.id = id;
        this.titulo = titulo;
        this.resumo = resumo;
        this.autores = autores != null ? autores : new ArrayList<>();
        this.ano = ano;
        this.url = url;
        this.citacoes = citacoes;
        this.referencias = referencias != null ? referencias : new ArrayList<>();
        this.venue = venue;
        this.doi = doi;
        this.favorito = false;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getResumo() {
        return resumo;
    }

    public void setResumo(String resumo) {
        this.resumo = resumo;
    }

    public List<Autor> getAutores() {
        return autores;
    }

    public void setAutores(List<Autor> autores) {
        this.autores = autores;
    }

    public Integer getAno() {
        return ano;
    }

    public void setAno(Integer ano) {
        this.ano = ano;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public int getCitacoes() {
        return citacoes;
    }

    public void setCitacoes(int citacoes) {
        this.citacoes = citacoes;
    }

    public List<String> getReferencias() {
        return referencias;
    }

    public void setReferencias(List<String> referencias) {
        this.referencias = referencias;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public String getDoi() {
        return doi;
    }

    public void setDoi(String doi) {
        this.doi = doi;
    }

    public boolean isFavorito() {
        return favorito;
    }

    public void setFavorito(boolean favorito) {
        this.favorito = favorito;
    }
}