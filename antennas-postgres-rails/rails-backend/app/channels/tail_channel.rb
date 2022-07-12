class TailChannel < ApplicationCable::Channel
  def subscribed
    stream_from "tail"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
