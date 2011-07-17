class CreateTestimonials < ActiveRecord::Migration
  def self.up
    create_table :testimonials do |t|
      t.string :title
      t.string :fullname
      t.text :testimonial
      t.integer :sortorder

      t.timestamps
    end
  end

  def self.down
    drop_table :testimonials
  end
end
