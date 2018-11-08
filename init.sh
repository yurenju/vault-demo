#!/bin/bash
set -x

export VAULT_ADDR="http://127.0.0.1:8200"
export VAULT_TOKEN="my-root-token"
export MYSQL_USERNAME="root"
export MYSQL_PASSWORD="my-secret-pw"

vault secrets enable database

vault write database/config/my-database \
    plugin_name=mysql-database-plugin \
    connection_url="{{username}}:{{password}}@tcp(mysql:3306)/" \
    allowed_roles=my-role username=${MYSQL_USERNAME} password=${MYSQL_PASSWORD}

vault write database/roles/my-role \
    db_name=my-database \
    creation_statements="CREATE USER '{{name}}'@'%' IDENTIFIED BY '{{password}}';GRANT SELECT ON *.* TO '{{name}}'@'%';" \
    default_ttl="10s" \
    max_ttl="20s"
