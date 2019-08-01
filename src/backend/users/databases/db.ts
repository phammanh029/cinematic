import mongoose from 'mongoose';

class DatabaseConnection {
  constructor(private dbUrl: string) {}
  public connect = async () => {
    await mongoose.connect(this.dbUrl, { useNewUrlParser: true });
  };

  public disconnect = async () => {
    await mongoose.disconnect();
  };
}

export default DatabaseConnection;
