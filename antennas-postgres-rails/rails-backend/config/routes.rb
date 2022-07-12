Rails.application.routes.draw do
  # Defines the root path route ("/")
  root "pages#index"

  mount ActionCable.server => '/cable'
end
