class CreateSitetexts < ActiveRecord::Migration
  def self.up
    create_table :sitetexts do |t|
      t.string :textkey
      t.text :sitetext
      t.boolean :is_active

      t.timestamps
    end
  end

  def self.down
    drop_table :sitetexts
  end
end
