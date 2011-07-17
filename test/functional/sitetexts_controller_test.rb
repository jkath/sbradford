require 'test_helper'

class SitetextsControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:sitetexts)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create sitetext" do
    assert_difference('Sitetext.count') do
      post :create, :sitetext => { }
    end

    assert_redirected_to sitetext_path(assigns(:sitetext))
  end

  test "should show sitetext" do
    get :show, :id => sitetexts(:one).to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => sitetexts(:one).to_param
    assert_response :success
  end

  test "should update sitetext" do
    put :update, :id => sitetexts(:one).to_param, :sitetext => { }
    assert_redirected_to sitetext_path(assigns(:sitetext))
  end

  test "should destroy sitetext" do
    assert_difference('Sitetext.count', -1) do
      delete :destroy, :id => sitetexts(:one).to_param
    end

    assert_redirected_to sitetexts_path
  end
end
