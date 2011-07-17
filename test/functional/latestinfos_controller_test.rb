require 'test_helper'

class LatestinfosControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:latestinfos)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create latestinfo" do
    assert_difference('Latestinfo.count') do
      post :create, :latestinfo => { }
    end

    assert_redirected_to latestinfo_path(assigns(:latestinfo))
  end

  test "should show latestinfo" do
    get :show, :id => latestinfos(:one).to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => latestinfos(:one).to_param
    assert_response :success
  end

  test "should update latestinfo" do
    put :update, :id => latestinfos(:one).to_param, :latestinfo => { }
    assert_redirected_to latestinfo_path(assigns(:latestinfo))
  end

  test "should destroy latestinfo" do
    assert_difference('Latestinfo.count', -1) do
      delete :destroy, :id => latestinfos(:one).to_param
    end

    assert_redirected_to latestinfos_path
  end
end
