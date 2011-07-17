set :application, "sbradford"
set :scm, :git
set :deploy_via, :remote_cache
set :git_enable_submodules, 1
set :repository, "git@github.com:jkath/sbradford.git"
set :domain,     "thebradfordteam.com"

set :user,     'deploy'
set :use_sudo, false
ssh_options[:paranoid] = false

task :staging do
  set :deploy_to,  "/var/www/html/rails/#{application}"
  set :user,     'deploy'
  set :password, 'd3pl0y'
  role :app, "192.168.2.10"
  role :web, "192.168.2.10"
  role :db,  "192.168.2.10", :primary => true
end

task :production do
  set :deploy_to,  "/var/www/html/rails/#{application}"
  set :password, 'd3pl0y'
  role :app, "190.120.226.226"
  role :web, "190.120.226.226"
  role :db,  "190.120.226.226", :primary => true
end

# external requirements:
### gems:

task :update_config, :roles => [:app] do
  run "cp -Rf #{shared_path}/config/* #{release_path}/config/"
  run "rm -rf #{release_path}/tmp && ln -nfs #{shared_path}/tmp #{release_path}/tmp"
  run "rm -rf #{release_path}/public/images/users && ln -nfs #{shared_path}/public/images/users #{release_path}/public/images/users"
  run "rm -rf #{release_path}/private && ln -nfs #{shared_path}/private #{release_path}/private"
end
after 'deploy:update_code', :update_config

namespace :deploy do
  namespace :passenger do
    desc "ask passenger to restart our rails app"
    task :restart do
      invoke_command "touch #{shared_path}/tmp/restart.txt"
    end
  end

  desc "Custom restart task for passenger"
  task :restart, :roles => :app, :except => { :no_release => true } do
    deploy.passenger.restart
  end
end

namespace :db do
  desc "Download a mysqldump of the remote database"
  task :download, :roles => :db, :only => { :primary => true } do
    db = YAML::load(ERB.new(capture("cat #{shared_path}/config/database.yml")).result)['production']
    filename = "#{db['database']}_dbdump_#{Time.now.strftime('%Y%m%d%H%M%S')}.sql"
    remote_dir = "#{shared_path}/backup"
    file = "#{remote_dir}/#{filename}"
    run "mkdir -p #{remote_dir}"
    on_rollback { run "rm -f #{file} #{file}.bz2" }
    run "mysqldump --add-drop-table -u #{db['username']} -h #{db['host']} -p #{db['database']} > #{file}" do |ch, stream, out|
      ch.send_data db['password']+"\n" if out =~ /Enter password:/
    end
    run "bzip2 #{file}"
    local_backup_dir = "#{File.dirname(__FILE__)}/../db/backup"
    FileUtils.mkdir_p local_backup_dir
    get "#{file}.bz2", "#{local_backup_dir}/#{filename}.bz2"
    run "rm #{file}.bz2"
  end
end
