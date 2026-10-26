"""Ejecutar contra una base de pruebas ya configurada. Conserva las cuentas creadas."""
import os, json, uuid, urllib.request, urllib.error, http.cookiejar
BASE = os.environ.get('CONTENTAI_TEST_URL', 'http://127.0.0.1:8000/api/index.php')
class Client:
    def __init__(self):
        self.http = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
        self.csrf = ''
    def call(self, action, data=None, expected=200, token=True):
        headers = {'Content-Type':'application/json'}
        if token: headers['X-CSRF-Token'] = self.csrf
        req = urllib.request.Request(BASE+'?action='+action, data=None if data is None else json.dumps(data).encode(), headers=headers)
        try:
            response = self.http.open(req)
        except urllib.error.HTTPError as e:
            response = e
        body = json.load(response)
        assert response.status == expected, (action,response.status,body)
        if action == 'session' and response.status == 200: self.csrf = body['csrf']
        return body
suffix = uuid.uuid4().hex[:12]
a,b=Client(),Client()
assert a.call('session')['user'] is None
a.call('saveCompany',{},expected=401)
a.call('register',{},expected=403,token=False)
email='test-'+suffix+'@example.com'
u=a.call('register',{'name':'Prueba integración','email':email,'password':'Prueba123!'})
assert u['email']==email and 'password_hash' not in u
assert a.call('company') is None
payload={'name':'Café de prueba','sector':'Alimentos y bebidas','city':'Chimbote','offer':'Café y panes','audience':'Estudiantes','differentiator':'Atención cercana','tone':'Cercano y amigable','goal':'Aumentar las ventas','channels':['Facebook','WhatsApp']}
a.call('saveCompany',{**payload,'channels':[]},expected=422)
assert a.call('company') is None
c=a.call('saveCompany',payload)
assert all(c[k]==v for k,v in payload.items())
c2=a.call('saveCompany',{**payload,'city':'Nuevo Chimbote'})
assert c2['id']==c['id'] and c2['city']=='Nuevo Chimbote'
p=a.call('savePost',{'channel':'Facebook','topic':'Promo','objective':'Ventas','text':'Texto inicial ☕' ,'status':'draft'})
p2=a.call('savePost',{**p,'text':'Texto editado','status':'approved'})
assert p['text']=='Texto inicial ☕'
assert p2['id']==p['id'] and len(a.call('posts'))==1
b.call('session')
b.call('register',{'name':'Segunda cuenta','email':email,'password':'Prueba123!'},expected=409)
b.call('register',{'name':'Segunda cuenta','email':'other-'+suffix+'@example.com','password':'Prueba123!'})
assert b.call('company') is None and b.call('posts')==[]
b.call('saveCompany',payload)
b.call('deletePost',{'id':p['id']},expected=404)
b.call('savePost',{**p,'text':'Ataque'},expected=404)
a.call('logout',{})
assert a.call('session')['user'] is None
a.call('company',expected=401)
a.call('login',{'email':email,'password':'incorrecta'},expected=401)
a.call('login',{'email':email,'password':'Prueba123!'})
assert a.call('company')['city']=='Nuevo Chimbote'
assert a.call('posts')[0]['text']=='Texto editado'
a.call('saveAvatar',{'value':'data:image/png;base64,bm90LWltYWdl'},expected=422)
image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII='
assert a.call('saveAvatar',{'value':image})['avatar']==image
assert a.call('session')['user']['avatar']==image
assert a.call('savePost',{**p2,'image':image})['image']==image
a.call('deletePost',{'id':p['id']})
assert a.call('posts')==[]
print('OK: registro, sesión, CSRF, contraseña, campos, edición, aislamiento y publicaciones.')
print('Correo para SELECT:',email)
