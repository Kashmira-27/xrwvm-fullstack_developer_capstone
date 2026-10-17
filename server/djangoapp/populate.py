from .models import CarMake, CarModel


def initiate():
    car_data = [
        {
            "make": "NISSAN",
            "description": "Nissan Motors",
            "models": [
                ("Pathfinder", "SUV", 2022),
                ("Qashqai", "SUV", 2021),
                ("XTRAIL", "SUV", 2020),
            ],
        },
        {
            "make": "Mercedes",
            "description": "Mercedes-Benz",
            "models": [
                ("C-Class", "SEDAN", 2022),
                ("E-Class", "SEDAN", 2021),
                ("GLA", "SUV", 2020),
            ],
        },
        {
            "make": "Audi",
            "description": "Audi Motors",
            "models": [
                ("A3", "SEDAN", 2022),
                ("A4", "SEDAN", 2021),
                ("Q5", "SUV", 2020),
            ],
        },
        {
            "make": "Kia",
            "description": "Kia Motors",
            "models": [
                ("Seltos", "SUV", 2022),
                ("Sportage", "SUV", 2021),
                ("Sorento", "SUV", 2020),
            ],
        },
        {
            "make": "Toyota",
            "description": "Toyota Motors",
            "models": [
                ("Corolla", "SEDAN", 2022),
                ("Camry", "SEDAN", 2021),
                ("RAV4", "SUV", 2020),
            ],
        },
    ]

    for item in car_data:
        make, created = CarMake.objects.get_or_create(
            name=item["make"],
            defaults={"description": item["description"]},
        )

        for model_name, model_type, year in item["models"]:
            CarModel.objects.get_or_create(
                car_make=make,
                name=model_name,
                defaults={
                    "dealer_id": 1,
                    "type": model_type,
                    "year": year,
                },
            )