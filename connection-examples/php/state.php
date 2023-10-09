<?php

class Update {
    private $value;
    private $diff;

    public function __construct($value, $diff) {
      $this->value = $value;
      $this->diff = $diff;
    }

    public function getValue() {
      return $this->value;
    }

    public function getDiff() {
      return $this->diff;
    }
}

class State {
  private $state;
  private $timestamp;
  private $valid;
  private $history;

  public function __construct($collectHistory = false) {
    $this->state = array();
    $this->timestamp = 0;
    $this->valid = true;

    // Define $history as a local variable
    $this->history = null;
    if ($collectHistory) {
      $this->history = array();
    }
  }

  public function get_history() {
    return $this->history;
  }

  public function get_state() {
    $list = array();

    foreach ($this->state as $key => $value) {
      $clone = json_decode($key);
      $i = 0;
      while ($i < $value) {
        $list[] = $clone;
        $i++;
      }
    }

    return $list;
  }

  public function validate($timestamp) {
    if (!$this->valid) {
      throw new Exception("Invalid state.");
    } elseif ($timestamp < $this->timestamp) {
      echo "Invalid timestamp.";
      $this->valid = false;
      throw new Exception("Update with timestamp ($timestamp) is lower than the last timestamp ({$this->timestamp}). Invalid state.");
    }
  }

  public function process(Update $update) {
    $value = json_encode($update->getValue());
    $diff = $update->getDiff();

    if (isset($this->state[$value])) {
      $count = $this->state[$value] + $diff;
    } else {
      $count = $diff;
    }

    if ($count <= 0) {
      unset($this->state[$value]);
    } else {
      $this->state[$value] = $count;
    }

    // Add the update to the history array
    if ($this->history !== null) {
      $this->history[] = $update;
    }
  }

  public function update($updates, $timestamp) {
    if (count($updates) > 0) {
      $this->validate($timestamp);
      $this->timestamp = $timestamp;

      foreach ($updates as $update) {
        $this->process($update);
      }
    }
  }
}
