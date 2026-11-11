package cache

import (
	"sync"
	"time"
)

type item struct {
	value   any
	expires time.Time
}

// Cache sederhana di memori dengan TTL.
type Cache struct {
	mu    sync.RWMutex
	items map[string]item
}

func New() *Cache {
	return &Cache{items: make(map[string]item)}
}

func (c *Cache) Get(key string) (any, bool) {
	c.mu.RLock()
	it, ok := c.items[key]
	c.mu.RUnlock()
	if !ok || time.Now().After(it.expires) {
		return nil, false
	}
	return it.value, true
}

func (c *Cache) Set(key string, value any, ttl time.Duration) {
	c.mu.Lock()
	c.items[key] = item{value: value, expires: time.Now().Add(ttl)}
	c.mu.Unlock()
}