package com.artigofinder.models;

public class FiltrosPesquisa {
    private Integer anoInicial;
    private Integer anoFinal;
    private Integer citacoesMinimas;
    private String ordenarPor;

    public FiltrosPesquisa() {
    }

    public FiltrosPesquisa(Integer anoInicial, Integer anoFinal, Integer citacoesMinimas, String ordenarPor) {
        this.anoInicial = anoInicial;
        this.anoFinal = anoFinal;
        this.citacoesMinimas = citacoesMinimas;
        this.ordenarPor = ordenarPor;
    }

    public Integer getAnoInicial() {
        return anoInicial;
    }

    public void setAnoInicial(Integer anoInicial) {
        this.anoInicial = anoInicial;
    }

    public Integer getAnoFinal() {
        return anoFinal;
    }

    public void setAnoFinal(Integer anoFinal) {
        this.anoFinal = anoFinal;
    }

    public Integer getCitacoesMinimas() {
        return citacoesMinimas;
    }

    public void setCitacoesMinimas(Integer citacoesMinimas) {
        this.citacoesMinimas = citacoesMinimas;
    }

    public String getOrdenarPor() {
        return ordenarPor;
    }

    public void setOrdenarPor(String ordenarPor) {
        this.ordenarPor = ordenarPor;
    }
}