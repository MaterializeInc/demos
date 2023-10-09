package main

import (
	"encoding/json"
	"errors"
	"fmt"
)

type SingleValue struct {
	Value interface{} `json:"value"`
}

type Update struct {
	value interface{} `json:"value"`
	diff  int64 `json:"diff"`
}

type State struct {
	state     map[string]int64
	timestamp int64
	valid     bool
	history   []Update
}

func NewState(collectHistory bool) *State {
	state := make(map[string]int64)
	history := []Update{}

	return &State{
		state:     state,
		timestamp: 0,
		valid:     true,
		history:   history,
	}
}

func (s *State) getState() []interface{} {
	list := []interface{}{}

	for key, value := range s.state {
		clone := make(map[string]interface{})
		err := json.Unmarshal([]byte(key), &clone)
		if err != nil {
			fmt.Println(err);
			continue
		}

		for i := int64(0); i < value; i++ {
			list = append(list, clone["value"])
		}
	}

	return list
}

func (s *State) getHistory() []Update {
	return s.history
}

func (s *State) validate(timestamp int64) error {
	if !s.valid {
		return errors.New("Invalid state.")
	} else if timestamp < s.timestamp {
		s.valid = false
		return errors.New("Invalid timestamp.")
	}
	return nil
}

func (s *State) process(update Update) {
	var sv = SingleValue { Value: update.value }
	value, err := json.Marshal(sv)
	// fmt.Println(sv, value);
	if err != nil {
		fmt.Println(err);
		return
	}

	count, ok := s.state[string(value)]
	if !ok {
		count = 0
	}

	count += update.diff

	if count <= 0 {
		delete(s.state, string(value))
	} else {
		s.state[string(value)] = count
	}

	if s.history != nil {
		s.history = append(s.history, update)
	}
}

func (s *State) Update(updates []Update, timestamp int64) error {
	if len(updates) > 0 {
		err := s.validate(timestamp)
		if err != nil {
			return err
		}
		s.timestamp = timestamp
		for _, update := range updates {
			s.process(update)
		}
	}
	return nil
}
