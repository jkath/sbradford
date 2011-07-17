require 'test_helper'

class FriendsofusersControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:friendsofusers)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create friendsofuser" do
    assert_difference('Friendsofuser.count') do
      post :create, :friendsofuser => { }
    end

    assert_redirected_to friendsofuser_path(assigns(:friendsofuser))
  end

  test "should show friendsofuser" do
    get :show, :id => friendsofusers(:one).to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => friendsofusers(:one).to_param
    assert_response :success
  end

  test "should update friendsofuser" do
    put :update, :id => friendsofusers(:one).to_param, :friendsofuser => { }
    assert_redirected_to friendsofuser_path(assigns(:friendsofuser))
  end

  test "should destroy friendsofuser" do
    assert_difference('Friendsofuser.count', -1) do
      delete :destroy, :id => friendsofusers(:one).to_param
    end

    assert_redirected_to friendsofusers_path
  end
end
