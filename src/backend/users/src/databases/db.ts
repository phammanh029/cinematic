import mongoose from "mongoose";

class DatabaseConnection {
    private dbUrl: string;

    public constructor(dbUrl: string) {
        this.dbUrl = dbUrl;
    }

    public connect = async (): Promise<typeof mongoose> => {
        return await mongoose.connect(this.dbUrl, { useNewUrlParser: true });
    };

    public disconnect = async (): Promise<void> => {
        await mongoose.disconnect();
    };
}

export default DatabaseConnection;
