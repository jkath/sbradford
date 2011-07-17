class CreateUsstates < ActiveRecord::Migration
  def self.up
    create_table :usstates do |t|
      t.string :statecode
      t.string :statename

      t.timestamps
    end
  end

  def self.down
    drop_table :usstates
  end
end
