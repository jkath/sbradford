class CreatePreferredpages < ActiveRecord::Migration
  def self.up
    create_table :preferredpages do |t|
      t.string :pagevalue
      t.string :pagedescription

      t.timestamps
    end
  end

  def self.down
    drop_table :preferredpages
  end
end
