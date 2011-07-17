class CreateArticles < ActiveRecord::Migration
  def self.up
    create_table :articles do |t|
      t.string :title
      t.boolean :as_popup
      t.text :description
      t.integer :sortorder

      t.timestamps
    end
  end

  def self.down
    drop_table :articles
  end
end
