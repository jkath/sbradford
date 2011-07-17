require 'test_helper'

class LatestnewsControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:latestnews)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create latestnew" do
    assert_difference('Latestnew.count') do
      post :create, :latestnew => { }
    end

    assert_redirected_to latestnew_path(assigns(:latestnew))
  end

  test "should show latestnew" do
    get :show, :id => latestnews(:one).to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => latestnews(:one).to_param
    assert_response :success
  end

  test "should update latestnew" do
    put :update, :id => latestnews(:one).to_param, :latestnew => { }
    assert_redirected_to latestnew_path(assigns(:latestnew))
  end

  test "should destroy latestnew" do
    assert_difference('Latestnew.count', -1) do
      delete :destroy, :id => latestnews(:one).to_param
    end

    assert_redirected_to latestnews_path
  end
end
