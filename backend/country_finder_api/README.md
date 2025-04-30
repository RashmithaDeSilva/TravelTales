# Country Finder API

This country finding API finds countries based on user description using `zero-shot-classification` ML model.

### Used Models
* [valhalla/distilbart-mnli-12-1](https://huggingface.co/valhalla/distilbart-mnli-12-1)
* [facebook/bart-large-mnli](https://huggingface.co/facebook/bart-large-mnli)

### Table of content
* [Env Setup](#env-setup)
* [API Runs](#api-runs)

<br><br>

## Env Setup
### Install virtualenv

Windows
```cmd
pip install virtualenv
```

Linux / MacOS
```sh
sudo apt install python3-virtualenv
```

<br>

### Create virtualenv using python and set environment name `env`.

Windows
```python
python -m virtualenv env
```

Linux / MacOS
```python
python3 -m virtualenv env
```

<br>

### Activate to endearment execute this command in `CMD`.

Windows
```cmd
env\Scripts\activate
```

Linux / MacOS
```python
source env/bin/activate
```

<br>

### Deactivate to endearment execute this command in `CMD`.
```cmd
deactivate
```

<br>

### Setup env with installing required libs that list with `requirements.txt`.

Windows
```cmd
pip install -r requirements.txt
```

Linux / MacOS
```python
pip3 install -r requirements.txt
```

<br>


### Verify Installation
```cmd
pip list
```

<br><br>

## API Setup
### How to run API
* Windows
    ```cmd
    python app.py
    ```
* Linux / MacOS
    ```sh
    python app.py
    ```

### API documentation
* Visit this url to get swagger doc
    ```url
    http://localhost:5000/apidocs/
    ```

<!-- ### How to run inside the server 
```sh
gunicorn -w 4 -b 0.0.0.0:5000 app:app
``` -->