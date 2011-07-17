require 'test_helper'

class SitelinksControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:sitelinks)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create sitelink" do
    assert_difference('Sitelink.count') do
      post :create, :sitelink => { }
    end

    assert_redirected_to sitelink_path(assigns(:sitelink))
  end

  test "should show sitelink" do
    get :show, :id => sitelinks(:one).to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => sitelinks(:one).to_param
    assert_response :success
  end

  test "should update sitelink" do
    put :update, :id => sitelinks(:one).to_param, :sitelink => { }
    assert_redirected_to sitelink_path(assigns(:sitelink))
  end

  test "should destroy sitelink" do
    assert_difference('Sitelink.count', -1) do
      delete :destroy, :id => sitelinks(:one).to_param
    end

    assert_redirected_to sitelinks_path
  end
end
