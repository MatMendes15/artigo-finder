package com.artigofinder.utils;

import java.util.LinkedHashMap;
import java.util.Map;

public class Cache<K, V> {
    private final int tamanhoMaximo;
    private final Map<K, V> cache;

    public Cache(int tamanhoMaximo) {
        this.tamanhoMaximo = tamanhoMaximo;
        this.cache = new LinkedHashMap<K, V>(tamanhoMaximo, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
                return size() > tamanhoMaximo;
            }
        };
    }

    public synchronized V obter(K chave) {
        return cache.get(chave);
    }

    public synchronized void adicionar(K chave, V valor) {
        cache.put(chave, valor);
    }

    public synchronized boolean contem(K chave) {
        return cache.containsKey(chave);
    }
}