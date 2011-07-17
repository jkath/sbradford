class CreatePricelists < ActiveRecord::Migration
  def self.up
    create_table :pricelists do |t|
      t.string :pricevalue
      t.string :pricelabel

      t.timestamps
    end
  end

  def self.down
    drop_table :pricelists
  end
end
