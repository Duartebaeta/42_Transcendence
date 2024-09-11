Ft_transcendence

---

## Run backend microservices

On the root of the project:

```
source venv/bin/activate
python env/generator.py
cp -r shared/ 'Name of the microservice'/srcs/
cd 'Name of the microservice'/srcs/
python manage.py runserver
```
