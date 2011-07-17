class CreateMessages < ActiveRecord::Migration
  def self.up
    create_table :messages do |t|
      t.integer :user_id
      t.integer :recipient_id
      t.integer :parent_message
      t.string :subject
      t.text :message
      t.boolean :hasbeenread

      t.timestamps
    end
  end

  def self.down
    drop_table :messages
  end
end
