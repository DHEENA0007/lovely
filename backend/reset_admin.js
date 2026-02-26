db.users.updateMany({role: 'admin'}, {$set: {email: 'admin@example.com', password: '$2a$10$Yvw0Z/u2A6C4eZ3f5.Q.K.B268571Xy0M4KzK6r3u7S' }})
