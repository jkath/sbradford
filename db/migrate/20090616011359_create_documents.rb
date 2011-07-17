class CreateDocuments < ActiveRecord::Migration
  def self.up
    create_table :documents do |t|
      t.string :title
      t.boolean :as_popup
      t.text :description
      t.string :document_file_name
      t.string :document_content_type
      t.integer :document_file_size
      t.integer :sortorder
      t.string :preferredpage

      t.timestamps
    end
  end

  def self.down
    drop_table :documents
  end
end
