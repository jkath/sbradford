class CreateSitelinks < ActiveRecord::Migration
  def self.up
    create_table :sitelinks do |t|
      t.string :title
      t.string :url
      t.boolean :is_popup
      t.string :photo_file_name
      t.string :photo_content_type
      t.integer :photo_file_size
      t.integer :sortorder
      t.string :preferredpage

      t.timestamps
    end
  end

  def self.down
    drop_table :sitelinks
  end
end
