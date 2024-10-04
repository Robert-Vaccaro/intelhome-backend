import { ProviderModel } from "../models/provider";

export class ProvidersController {
    async createProvider(provider) {
      const newProvider = new ProviderModel(provider);
      await newProvider.save();
      return newProvider.toJSON();
    }

    async getProviders() {
        return ProviderModel.find();
    }
  }