import { NotFoundError } from "../../utils/error/NotFoundError";
import { requiredText } from "../../utils/input";
import { CategoryRepository } from "./category.repository";

export class CategoryService {
  constructor(private categoryRepo: CategoryRepository) {}

  list() {
    return this.categoryRepo.list();
  }

  create(name: unknown) {
    return this.categoryRepo.create(requiredText(name, "name"));
  }

  async update(id: string, name: unknown) {
    const label = requiredText(name, "name");
    if (!await this.categoryRepo.findById(id)) throw new NotFoundError("Category not found");
    return this.categoryRepo.update(id, label);
  }
}
