require 'test_helper'

class TestingsControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:testings)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create testing" do
    assert_difference('Testing.count') do
      post :create, :testing => { }
    end

    assert_redirected_to testing_path(assigns(:testing))
  end

  test "should show testing" do
    get :show, :id => testings(:one).to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => testings(:one).to_param
    assert_response :success
  end

  test "should update testing" do
    put :update, :id => testings(:one).to_param, :testing => { }
    assert_redirected_to testing_path(assigns(:testing))
  end

  test "should destroy testing" do
    assert_difference('Testing.count', -1) do
      delete :destroy, :id => testings(:one).to_param
    end

    assert_redirected_to testings_path
  end
end
