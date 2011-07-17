class CreateListingphotos < ActiveRecord::Migration
  def self.up
    create_table :listingphotos do |t|
      t.integer :listing_id
      t.string :description
      t.string :photo_file_name
      t.string :photo_content_type
      t.integer :photo_file_size

      t.timestamps
    end
  end

  def self.down
    drop_table :listingphotos
  end
end
