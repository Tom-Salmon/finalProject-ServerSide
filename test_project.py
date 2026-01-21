import requests
import sys

# --- כאן אתה צריך להדביק את הכתובות מ-Render ---
# שים לב: ללא לוכסן (slash) בסוף הכתובת!

# (a) Logs Service URL
a = "https://logs-service-final.onrender.com"

# (b) Users Service URL
b = "https://users-service-final.onrender.com"

# (c) Costs Service URL
c = "https://costs-service-final.onrender.com"

# (d) Admin Service URL
d = "https://admin-service-final.onrender.com"

# -----------------------------------------------

filename = input("filename= ")

output = open(filename, "w")
sys.stdout = output

print("a=" + a)
print("b=" + b)
print("c=" + c)
print("d=" + d) # Note: Original code printed 'a' here, but logical mapping suggests 'd'

print()
print("testing getting the about")
print("-------------------------")

try:
    text = ""
    # getting details of team manager
    url = d + "/api/about/"
    data = requests.get(url)
    
    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
    print("data.text=" + data.text)
    # print(data.json()) # Commented out in case response isn't JSON, prevents crash

except Exception as e:
    print("problem")
    print(e)

print("")
print()

print("testing getting the report - 1")
print("------------------------------")

try:
    text = ""
    # getting the report
    url = c + "/api/report/?id=123123&year=2026&month=1"
    data = requests.get(url)
    
    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
    print("data.text=" + data.text)
    print(text)

except Exception as e:
    print("problem")
    print(e)

print("")
print()

print("testing adding cost item")
print("----------------------------------")

try:
    text = ""
    url = c + "/api/add/"
    # Note: Ensure the keys match your API (userid vs user_id)
    data = requests.post(url, json={'userid': 123123, 'description': 'milk 9', 'category': 'food', 'sum': 8})
    
    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)

except Exception as e:
    print("problem")
    print(e)

print("")
print()

print("testing getting the report - 2")
print("------------------------------")

try:
    text = ""
    # getting the report again to see the added item
    url = c + "/api/report/?id=123123&year=2026&month=1"
    data = requests.get(url)
    
    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
    print("data.text=" + data.text)
    print(text)

except Exception as e:
    print("problem")
    print(e)

print("")
# Don't forget to close the file!
output.close()