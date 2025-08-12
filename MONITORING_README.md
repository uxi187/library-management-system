# Library App Monitoring Stack

This document describes the observability stack added to the Library App for production monitoring and logging.

## Stack Components

### 1. Prometheus (Port 9090)
- **Purpose**: Metrics collection and storage
- **Access**: http://localhost:9090
- **Configuration**: `monitoring/prometheus.yml`
- **Data**: Stored in `prometheus_data` volume

### 2. Loki (Port 3100)
- **Purpose**: Log aggregation and storage
- **Access**: http://localhost:3100
- **Configuration**: `monitoring/loki.yml`
- **Data**: Stored in `loki_data` volume

### 3. Promtail
- **Purpose**: Log shipping agent (sends logs to Loki)
- **Configuration**: `monitoring/promtail.yml`
- **Sources**: Docker container logs, system logs

### 4. Grafana (Port 3002)
- **Purpose**: Visualization and dashboards
- **Access**: http://localhost:3002
- **Default credentials**: admin/admin
- **Configuration**: `monitoring/grafana/provisioning/`
- **Dashboards**: `monitoring/grafana/dashboards/`
- **Data**: Stored in `grafana_data` volume

### 5. Node Exporter (Port 9100)
- **Purpose**: System metrics collection
- **Access**: http://localhost:9100
- **Metrics**: CPU, memory, disk, network usage

## Quick Start

1. Start the complete stack:
```bash
docker-compose up -d
```

2. Access services:
- **Grafana Dashboard**: http://localhost:3002 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100

3. View pre-configured dashboard:
   - Login to Grafana
   - Navigate to "Library App Dashboard"
   - Monitor application metrics and logs

## Features

### Monitoring
- **System Metrics**: CPU, memory, disk usage
- **Application Health**: Service uptime status
- **Container Metrics**: Docker container statistics
- **Custom Alerts**: Configurable alerting rules

### Logging
- **Centralized Logs**: All application logs in one place
- **Real-time**: Live log streaming
- **Searchable**: Query logs by service, level, content
- **Retention**: Configurable log retention periods

### Dashboards
- **System Overview**: Infrastructure health
- **Application Metrics**: Service-specific monitoring
- **Log Analysis**: Real-time log exploration
- **Custom Views**: Create your own dashboards

## Configuration Files

```
monitoring/
├── prometheus.yml          # Prometheus configuration
├── alert_rules.yml         # Alerting rules
├── loki.yml               # Loki configuration
├── promtail.yml           # Promtail configuration
└── grafana/
    ├── provisioning/
    │   ├── datasources/
    │   │   └── datasources.yml    # Auto-configure data sources
    │   └── dashboards/
    │       └── dashboards.yml     # Auto-load dashboards
    └── dashboards/
        └── library-app-dashboard.json
```

## Metrics Collection

### Automatic Metrics
- **Node Exporter**: System-level metrics
- **Container Logs**: All service logs via Loki driver

### Application Metrics (Optional)
To add custom application metrics:

1. **Backend (Node.js)**:
   - Add `prom-client` dependency
<<<<<<< HEAD
   - Expose `` endpoint
=======
   - Expose `/metrics` endpoint
>>>>>>> 5b5e69ce8e97c7237075b7e33f1a5f4ffab5a28a
   - Already configured in Prometheus scrape config

2. **Frontend (Next.js)**:
   - Add metrics middleware
   - Expose `/api/metrics` endpoint
   - Already configured in Prometheus scrape config

## Log Configuration

### Automatic Log Collection
All services are configured with Loki logging driver:
- Backend: `service=backend`
- Frontend: `service=frontend`
- Nginx: `service=nginx`

### Log Formats
Logs are automatically parsed and labeled by:
- Service name
- Container name
- Log level (if structured)
- Timestamp

### Querying Logs
Example Loki queries:
```
{service="backend"}                    # All backend logs
{service="frontend"} |= "error"        # Frontend error logs
{service=~"backend|frontend"}          # Combined app logs
```

## Alerting

### Pre-configured Alerts
- High CPU usage (>80% for 5min)
- High memory usage (>85% for 5min)
- Low disk space (<10%)
- Service down (>1min)
- High HTTP error rate (>10% for 5min)

### Adding Custom Alerts
1. Edit `monitoring/alert_rules.yml`
2. Restart Prometheus: `docker-compose restart prometheus`

## Production Considerations

### Security
- [ ] Change default Grafana password
- [ ] Enable authentication for Prometheus/Loki
- [ ] Restrict network access to monitoring ports
- [ ] Use HTTPS with proper certificates

### Performance
- [ ] Configure log rotation and retention
- [ ] Set appropriate resource limits
- [ ] Monitor monitoring stack resource usage
- [ ] Consider external storage for long-term retention

### Backup
- [ ] Backup Grafana dashboards and configuration
- [ ] Export important metrics data
- [ ] Document custom configurations

## Troubleshooting

### Common Issues

1. **Service Not Found**
   - Check service health: `docker-compose ps`
   - View logs: `docker-compose logs [service-name]`

2. **No Metrics Data**
   - Verify Prometheus targets: http://localhost:9090/targets
   - Check service `/metrics` endpoints

3. **No Log Data**
   - Verify Loki status: http://localhost:3100/ready
   - Check Promtail logs: `docker-compose logs promtail`

4. **Dashboard Issues**
   - Check datasource connectivity in Grafana
   - Verify dashboard queries and time ranges

### Log Locations
- Application logs: Available in Grafana Logs panel
- System logs: `docker-compose logs [service-name]`
- Monitoring logs: Check individual service logs

## Useful Commands

```bash
# Start monitoring stack only
docker-compose up -d prometheus loki promtail grafana node-exporter

# View service logs
docker-compose logs -f backend frontend

# Restart monitoring services
docker-compose restart prometheus loki grafana

# Clean up monitoring data
docker-compose down -v
```

## Next Steps

1. **Customize Dashboards**: Create service-specific dashboards
2. **Add Application Metrics**: Instrument your application code
3. **Configure Alerting**: Set up notification channels
4. **Optimize Performance**: Tune retention and resource usage
5. **Security Hardening**: Implement authentication and authorization

For more information, refer to the official documentation:
- [Prometheus](https://prometheus.io/docs/)
- [Grafana](https://grafana.com/docs/)
<<<<<<< HEAD
- [Loki](https://grafana.com/docs/loki/)
=======
- [Loki](https://grafana.com/docs/loki/)
>>>>>>> 5b5e69ce8e97c7237075b7e33f1a5f4ffab5a28a
