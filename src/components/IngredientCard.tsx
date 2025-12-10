interface IngredientCardProps {
  name: string;
  quantity: number;
  unit: string;
}

export default function IngredientCard({
  name,
  quantity,
  unit,
}: IngredientCardProps) {
  return (
    <div>
      <div className="relative pl-6">
        <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-emerald-600" />
        <span className="font-medium capitalize">{name}</span>
        <span className="text-gray-500 ml-1">
          ({quantity}
          {unit})
        </span>
      </div>
    </div>
  );
}
