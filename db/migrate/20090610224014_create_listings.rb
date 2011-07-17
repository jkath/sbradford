class CreateListings < ActiveRecord::Migration
  def self.up
    create_table :listings do |t|
      t.integer :user_id
      t.string :title
      t.text :description
      t.integer :beds
      t.decimal :baths
      t.string :location
      t.string :statecode
      t.string :city
      t.string :zip
      t.price :price
      t.integer :taxes
      t.string :taxyear
      t.text :otherinfo

      t.timestamps
    end
  end

  def self.down
    drop_table :listings
  end
end
